import logging
import argparse
import sys
import pathlib
import shutil
import logging
from tqdm import tqdm

FILE_TYPE_MAP = {
    "image": ['.jpeg', '.jpg', '.png', '.gif', '.svg'],
    "Documents": ['.pdf', '.docx', '.txt', '.pptx', '.xlsx'],
    "Audio": ['.mp3', '.wav', '.aac'],
    "Video": ['.mp4', '.mov', '.avi', '.mkv'],
    "Archives": ['.zip', '.rar', '.tar', '.gz'],
    "Other": []
}


def organize_directory(source_path: pathlib.Path):
    print(f"Organizing files in: {source_path}")
    logging.info(f"Starting to organize directory: {source_path}")

    files_to_process = [
        item for item in source_path.iterdir() if item.is_file()]

    for item in tqdm(files_to_process, desc="Organizing Files"):
        file_extension = item.suffix

        print(f"-file name: {item.name}  Extension: {file_extension}")

        destination_folder_name = 'other'

        for category, extensions in FILE_TYPE_MAP.items():
            if file_extension in extensions():
                destination_folder_name = category
                break

        destination_dir = source_path/destination_folder_name

        if dry_run:
            destination_file_path = destination_dir / item.name
            logging.info(
                f"[DRY RUN] Would move '{item.name}' -> '{destination_file_path}'")
        else:
            destination_dir.mkdir(parents=True, exist_ok=True)
            destination_file_path = destination_dir/item.name

            counter = 1
            while destination_file_path.exists():
                logging.warning(
                    f"Conflict: '{destination_file_path}' already exists.")

                new_filename = f"{item.stem} ({counter}){item.suffix}"
                destination_file_path = destination_dir / new_filename
                counter += 1

            try:
                shutil.move(item, destination_file_path)
                logging.info(
                    f"Moved: '{item.name}' -> '{destination_file_path}'")
            except PermissionError as e:
                logging.error(f"Could not move '{item.name}'. Error: {e}")
            except Exception as e:
                logging.error(
                    f"An unexpected error occurred while moving '{item.name}'. Error: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Organize files in a directory by their type.")

    parser.add_argument('source_directory',
                        help="The path to the directory you want to organize.")

    args = parser.parse_args()

    parser.add_argument('--dry-run', action='store_true',
                        help='Simulate the organization without moving files.')

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[logging.FileHandler(
            "organizer.py"), logging.StreamHandler("sys.stdout")]
    )

    source_path = pathlib.Path(args.source_directory)

    print(f"The organized file is {args.source_directory}")

    if not source_path.exists() or not source_path.is_dir():
        print(
            f"Error: The path '{source_path}' does not exist or is not a directory.")
        sys.exit(1)

    print(f"Organizing files in: {source_path}")
    organize_directory(source_path)
