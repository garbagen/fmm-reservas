import os
import shutil

def copy_files():
    # Set specific paths
    source_folder = r"C:\Users\gabyr\fmm"
    destination_folder = r"C:\Users\gabyr\fmm\copia"
    folders_to_ignore = ['backend\\node_modules', 'backend\\uploads', '.git', 'frontend\\node_modules', 'frontend-old']
    
    # Create destination folder if it doesn't exist
    os.makedirs(destination_folder, exist_ok=True)
    
    files_copied = 0
    
    # Walk through all directories and files
    for root, dirs, files in os.walk(source_folder):
        # Skip the destination folder itself to avoid infinite copying
        if destination_folder in root:
            continue
            
        # Skip ignored folders
        if any(ignore_folder in root for ignore_folder in folders_to_ignore):
            continue
            
        # Process each file
        for file in files:
            source_path = os.path.join(root, file)
            dest_path = os.path.join(destination_folder, file)
            
            # Handle potential name conflicts by adding a number if file exists
            if os.path.exists(dest_path):
                base, extension = os.path.splitext(file)
                counter = 1
                while os.path.exists(dest_path):
                    dest_path = os.path.join(destination_folder, f"{base}_{counter}{extension}")
                    counter += 1
            
            # Copy the file
            try:
                shutil.copy2(source_path, dest_path)
                files_copied += 1
                print(f"Copied: {file} -> {dest_path}")
            except Exception as e:
                print(f"Error copying {file}: {str(e)}")
            
    print(f"\nCopied {files_copied} files to {destination_folder}")

# Run the copy operation
print("Starting copy process...")
copy_files()
print("Copy completed!")
