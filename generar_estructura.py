import os

def create_project_structure(source_folder, output_file, ignore_folders=None, ignore_extensions=None):
    # Set default ignored folders and extensions if not provided
    if ignore_folders is None:
        ignore_folders = ['backend' + os.sep + 'node_modules', '.git', 'uploads', 'copia']
    if ignore_extensions is None:
        ignore_extensions = ['.bak']

    with open(output_file, 'w', encoding='utf-8') as f:
        for root, dirs, files in os.walk(source_folder):
            # Filter out ignored folders
            dirs[:] = [d for d in dirs if not any(os.path.join(root, d).endswith(ignore) for ignore in ignore_folders)]

            # Calculate indentation based on folder depth
            relative_path = os.path.relpath(root, source_folder)
            level = relative_path.count(os.sep)
            indent = '│   ' * level + '├── ' if relative_path != '.' else ''
            folder_name = os.path.basename(root) if relative_path != '.' else os.path.basename(source_folder)
            f.write(f"{indent}{folder_name}\n")

            # Write files (ignoring .bak files)
            for file in files:
                if any(file.endswith(ext) for ext in ignore_extensions):
                    continue
                file_indent = '│   ' * (level + 1) + '└── '
                f.write(f"{file_indent}{file}\n")

    print(f"\n✅ Project structure saved to: {output_file}")

# Define paths
source_folder = r"C:\Users\gabyr\fmm"
output_file = r"C:\Users\gabyr\fmm\project_structure.txt"

# Run the function
print(f"🔍 Scanning directory: {source_folder}")
create_project_structure(source_folder, output_file)
