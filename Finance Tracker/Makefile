.PHONY: install start-backend start-frontend start

# Install all dependencies for frontend and backend
install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend/web-app && npm install

# Start the frontend development server
start-frontend:
	@echo "Starting frontend server..."
	cd frontend/web-app && npm run dev

# Start the backend services (assuming a start-all script or similar)
start-backend:
	@echo "Starting backend services..."
	cd backend && node start-all.js

# Start everything concurrently
start:
	@echo "Starting standard setup..."
	make install
	make start-backend & make start-frontend

# Clean up build artifacts and dependencies
clean:
	@echo "Cleaning up..."
	rm -rf node_modules
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	find . -name "build" -type d -prune -exec rm -rf '{}' +
	find . -name ".next" -type d -prune -exec rm -rf '{}' +
	find . -name "coverage" -type d -prune -exec rm -rf '{}' +
	rm -f *.log *.txt
