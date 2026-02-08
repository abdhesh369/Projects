import argparse
import json
import logging
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any
class OrganizerError(Exception):
    pass

class ConfigError(OrganizerError):
    pass

class FileOperationError(OrganizerError):
    pass

@dataclass
class OperationRecord:
    source: Path
    destination: Path
    timestamp: str
    
    def to_dict(self) -> Dict[str, str]:
        return {
            "source": str(self.source),
            "destination": str(self.destination),
            "timestamp": self.timestamp
        }


class FileOrganizer:
    def __init__(self, file_type_map: Dict[str, List[str]], 
                 dry_run: bool = False,
                 skip_hidden: bool = True,
                 recursive: bool = False):
        self.file_type_map = {k: [ext.lower() for ext in v] 
                             for k, v in file_type_map.items()}
        self.dry_run = dry_run
        self.skip_hidden = skip_hidden
        self.recursive = recursive
        self.operations: List[OperationRecord] = []
        self.stats = {
            "processed": 0,
            "moved": 0,
            "skipped": 0,
            "errors": 0,
            "conflicts_resolved": 0
        }
    
    def get_category(self, file_path: Path) -> str:
        extension = file_path.suffix.lower()
        
        for category, extensions in self.file_type_map.items():
            if extension in extensions:
                return category
        return "other"
    
    def generate_unique_path(self, destination_dir: Path, 
                            original_path: Path) -> Path:
        destination = destination_dir / original_path.name
        
        if not destination.exists():
            return destination
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        counter = 1
        stem = original_path.stem
        suffix = original_path.suffix
        
        while True:
            new_name = f"{stem}_{timestamp}_{counter:03d}{suffix}"
            destination = destination_dir / new_name
            if not destination.exists():
                self.stats["conflicts_resolved"] += 1
                return destination
            counter += 1
            
            if counter > 999:
                raise FileOperationError(
                    f"Cannot generate unique name for {original_path}"
                )
    
    def organize_file(self, file_path: Path, source_root: Path) -> bool:
        if self.skip_hidden and file_path.name.startswith('.'):
            logging.debug(f"Skipping hidden file: {file_path.name}")
            self.stats["skipped"] += 1
            return True
        
        if file_path.name in ['organizer.log', 'organizer_undo.json']:
            return True
        
        category = self.get_category(file_path)
        destination_dir = source_root / category
        
        try:
            destination_path = self.generate_unique_path(destination_dir, file_path)
            
            if self.dry_run:
                logging.info(f"[DRY RUN] Would move: {file_path.name} -> {category}/")
                print(f"  [DRY RUN] {file_path.name} -> {category}/")
                return True
            
            destination_dir.mkdir(parents=True, exist_ok=True)
            
            shutil.move(str(file_path), str(destination_path))
            
            self.operations.append(OperationRecord(
                source=file_path,
                destination=destination_path,
                timestamp=datetime.now().isoformat()
            ))
            
            logging.info(f"Moved: {file_path.name} -> {destination_path}")
            self.stats["moved"] += 1
            return True
            
        except PermissionError as e:
            logging.error(f"Permission denied: {file_path.name} - {e}")
            self.stats["errors"] += 1
            return False
        except OSError as e:
            logging.error(f"OS error with {file_path.name}: {e}")
            self.stats["errors"] += 1
            return False
        except Exception as e:
            logging.error(f"Unexpected error with {file_path.name}: {e}")
            self.stats["errors"] += 1
            return False
    
    def organize_directory(self, source_path: Path) -> None:
        if not source_path.exists():
            raise FileOperationError(f"Source path does not exist: {source_path}")
        
        if not source_path.is_dir():
            raise FileOperationError(f"Source path is not a directory: {source_path}")
        
        logging.info(f"Starting organization of: {source_path}")
        print(f"\n Organizing: {source_path}")
        
        if self.recursive:
            files_to_process = [
                f for f in source_path.rglob('*') 
                if f.is_file() and f.parent == source_path or 
                (self.recursive and f.is_file())
            ]
            files_to_process = [
                f for f in files_to_process 
                if not any(cat in f.parts for cat in self.file_type_map.keys())
                and f.parent.name != "other"
            ]
        else:
            files_to_process = [
                f for f in source_path.iterdir() 
                if f.is_file()
            ]
        
        if not files_to_process:
            print("  No files to organize.")
            return
        
        try:
            from tqdm import tqdm
            iterator = tqdm(files_to_process, desc="Processing", unit="files")
        except ImportError:
            iterator = files_to_process
            print(f"Processing {len(files_to_process)} files...")
        
        for file_path in iterator:
            self.stats["processed"] += 1
            success = self.organize_file(file_path, source_path)
            
            if not success and not isinstance(iterator, list):
                iterator.set_postfix(errors=self.stats["errors"])
        
        self._print_summary()
    
    def _print_summary(self) -> None:
        mode = "DRY RUN" if self.dry_run else "LIVE"
        print(f"\n{'='*50}")
        print(f" Operation Summary ({mode})")
        print(f"{'='*50}")
        print(f"Files processed: {self.stats['processed']}")
        print(f"Files moved:     {self.stats['moved']}")
        print(f"Files skipped:   {self.stats['skipped']}")
        print(f"Errors:          {self.stats['errors']}")
        if self.stats['conflicts_resolved'] > 0:
            print(f"Conflicts resolved: {self.stats['conflicts_resolved']}")
        print(f"{'='*50}\n")
    
    def save_undo_log(self, log_path: Path = Path("organizer_undo.json")) -> None:
        if self.dry_run or not self.operations:
            return
        
        try:
            with open(log_path, 'w') as f:
                json.dump([op.to_dict() for op in self.operations], f, indent=2)
            logging.info(f"Undo log saved to: {log_path}")
        except Exception as e:
            logging.warning(f"Could not save undo log: {e}")
    
    @staticmethod
    def undo_operations(log_path: Path = Path("organizer_undo.json")) -> bool:
        if not log_path.exists():
            print(f"No undo log found at: {log_path}")
            return False
        
        try:
            with open(log_path, 'r') as f:
                operations = json.load(f)
            
            print(f"Undoing {len(operations)} operations...")
            
            for op in reversed(operations):
                src = Path(op['destination'])
                dst = Path(op['source'])
                
                if src.exists():
                    dst.parent.mkdir(parents=True, exist_ok=True)
                    shutil.move(str(src), str(dst))
                    print(f"  Restored: {src.name}")
                else:
                    print(f"  Warning: Source not found: {src}")
            
            backup_name = f"organizer_undo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            log_path.rename(backup_name)
            print(f"Undo complete. Log backed up to: {backup_name}")
            return True
            
        except Exception as e:
            logging.error(f"Undo failed: {e}")
            return False


def load_config(config_path: Path) -> Dict[str, Any]:
    if not config_path.exists():
        raise ConfigError(
            f"Configuration file not found: {config_path}\n"
            "Create a config.json file with 'file_types' mapping."
        )
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
    except json.JSONDecodeError as e:
        raise ConfigError(f"Invalid JSON in config file: {e}")
    except Exception as e:
        raise ConfigError(f"Error reading config file: {e}")
    
    if 'file_types' not in config:
        raise ConfigError("Config must contain 'file_types' key")
    
    if not isinstance(config['file_types'], dict):
        raise ConfigError("'file_types' must be a dictionary")
    
    for category, extensions in config['file_types'].items():
        if not isinstance(extensions, list):
            raise ConfigError(
                f"Extensions for '{category}' must be a list"
            )
        for ext in extensions:
            if not isinstance(ext, str):
                raise ConfigError(
                    f"Invalid extension type in '{category}': {ext}"
                )
            if not ext.startswith('.'):
                logging.warning(
                    f"Extension '{ext}' in '{category}' should start with '.'"
                )
    
    return config


def setup_logging(verbose: bool = False) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    
    handlers = [
        logging.FileHandler("organizer.log", mode='a'),
        logging.StreamHandler(sys.stdout)
    ]
    
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=handlers
    )


def create_sample_config(path: Path = Path("config.json")) -> None:
    sample_config = {
        "file_types": {
            "images": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"],
            "documents": [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"],
            "spreadsheets": [".xls", ".xlsx", ".csv", ".ods"],
            "presentations": [".ppt", ".pptx", ".odp"],
            "archives": [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
            "audio": [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"],
            "video": [".mp4", ".avi", ".mkv", ".mov", ".wmv", ".flv"],
            "code": [".py", ".js", ".html", ".css", ".java", ".cpp", ".c", ".h"],
            "executables": [".exe", ".msi", ".dmg", ".pkg", ".deb", ".rpm"]
        }
    }
    
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(sample_config, f, indent=2)
    
    print(f"Sample config created at: {path}")


def main():
    parser = argparse.ArgumentParser(
        description="Organize files by type into categorized folders.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s ~/Downloads                    
  %(prog)s ~/Downloads --dry-run          
  %(prog)s ~/Downloads --recursive        
  %(prog)s --undo                         
  %(prog)s --create-config                
        """
    )
    
    parser.add_argument(
        'source_directory',
        nargs='?',
        help="Directory to organize (optional if using --undo or --create-config)"
    )
    
    parser.add_argument(
        '--dry-run', '-n',
        action='store_true',
        help='Simulate operations without moving files'
    )
    
    parser.add_argument(
        '--config', '-c',
        default='config.json',
        help='Path to configuration file (default: config.json)'
    )
    
    parser.add_argument(
        '--recursive', '-r',
        action='store_true',
        help='Organize files in subdirectories recursively'
    )
    
    parser.add_argument(
        '--include-hidden',
        action='store_true',
        help='Include hidden files (starting with .)'
    )
    
    parser.add_argument(
        '--undo', '-u',
        action='store_true',
        help='Undo last organization operation'
    )
    
    parser.add_argument(
        '--create-config',
        action='store_true',
        help='Create a sample configuration file and exit'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    setup_logging(args.verbose)
    
    if args.create_config:
        create_sample_config()
        return 0
    
    if args.undo:
        success = FileOrganizer.undo_operations()
        return 0 if success else 1
    
    if not args.source_directory:
        parser.error("source_directory is required (unless using --undo or --create-config)")
    
    source_path = Path(args.source_directory).expanduser().resolve()
    
    if not source_path.exists():
        print(f"Error: Path does not exist: {source_path}")
        return 1
    
    if not source_path.is_dir():
        print(f"Error: Not a directory: {source_path}")
        return 1
    
    try:
        config = load_config(Path(args.config))
    except ConfigError as e:
        print(f"Configuration Error: {e}")
        return 1
    
    try:
        organizer = FileOrganizer(
            file_type_map=config['file_types'],
            dry_run=args.dry_run,
            skip_hidden=not args.include_hidden,
            recursive=args.recursive
        )
        
        organizer.organize_directory(source_path)
        
        if not args.dry_run:
            organizer.save_undo_log()
        
        return 0
        
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user")
        return 130
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())