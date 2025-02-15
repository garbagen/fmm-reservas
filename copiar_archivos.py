import os
import shutil

def copy_files():
    source_folder = r"C:\Users\gabyr\fmm"
    destination_folder = r"C:\Users\gabyr\fmm\copia"
    folders_to_ignore = ['backend\\node_modules', 'backend\\uploads', '.git', 'frontend\\node_modules', 'frontend-old']

    # Delete the destination folder if it exists
    if os.path.exists(destination_folder):
        print(f"Deleting existing folder: {destination_folder}")
        shutil.rmtree(destination_folder)

    # Create a fresh destination folder
    os.makedirs(destination_folder)
    files_copied = 0

    for root, dirs, files in os.walk(source_folder):
        if destination_folder in root:
            continue

        if any(ignore_folder in root for ignore_folder in folders_to_ignore):
            continue

        for file in files:
            if file == 'package-lock.json':
                continue

            source_path = os.path.join(root, file)
            dest_path = os.path.join(destination_folder, file)

            if os.path.exists(dest_path):
                base, extension = os.path.splitext(file)
                counter = 1
                while os.path.exists(dest_path):
                    dest_path = os.path.join(destination_folder, f"{base}_{counter}{extension}")
                    counter += 1

            try:
                shutil.copy2(source_path, dest_path)
                files_copied += 1
                print(f"Copied: {file} -> {dest_path}")
            except Exception as e:
                print(f"Error copying {file}: {str(e)}")

    print(f"\nCopied {files_copied} files to {destination_folder}")

print("Starting copy process...")
copy_files()
print("Copy completed!")