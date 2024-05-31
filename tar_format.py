import os
import tarfile
import shutil
import argparse

def extract_tar(archive_path, extract_path):
    with tarfile.open(archive_path, 'r') as tar:
        tar.extractall(path=extract_path)

def rename_files(root_path):
    for root, dirs, files in os.walk(root_path):
        if 'laksi_SOV' in dirs:
            new_z1_path = os.path.join(root, 'z1')
            os.rename(os.path.join(root, 'laksi_SOV'), new_z1_path)
            rename_zad_S_file(new_z1_path, 'z1')
            
        if 'SOV' in dirs:
            new_z2_path = os.path.join(root, 'z2')
            os.rename(os.path.join(root, 'SOV'), new_z2_path)
            rename_zad_S_file(new_z2_path, 'z2')

def rename_zad_S_file(folder_path, new_name):
    zad_S_file = 'zad.S'
    for f in os.listdir(folder_path):
        if f == zad_S_file:
            new_file_path = os.path.join(folder_path, f'{new_name}.S')
            os.rename(os.path.join(folder_path, f), new_file_path)

def create_tgz_from_folder(folder_path, tgz_path):
    with tarfile.open(tgz_path, 'w:gz') as tar:
        for folder_name, subfolders, filenames in os.walk(folder_path):
            for filename in filenames:
                file_path = os.path.join(folder_name, filename)
                arcname = os.path.relpath(file_path, folder_path)
                tar.add(file_path, arcname)
    shutil.rmtree(folder_path)

def process_archives(main_archive_path):
    base_dir = os.path.dirname(main_archive_path)
    extract_path = os.path.join(base_dir, 'extracted')
    os.makedirs(extract_path, exist_ok=True)

    extract_tar(main_archive_path, extract_path)

    for item in os.listdir(extract_path):
        item_path = os.path.join(extract_path, item)
        if tarfile.is_tarfile(item_path):
            archive_extract_path = os.path.join(extract_path, item[:-4])
            os.makedirs(archive_extract_path, exist_ok=True)
            extract_tar(item_path, archive_extract_path)

            home_provera_path = os.path.join(archive_extract_path, 'home', 'provera')
            for folder in os.listdir(home_provera_path):
                if folder != 'Desktop':
                    target_folder = os.path.join(home_provera_path, folder)
                    rename_files(target_folder)
            create_tgz_from_folder(archive_extract_path, item_path)

    new_archive_path = main_archive_path.replace('.tar', '_processed.tar')
    with tarfile.open(new_archive_path, 'w') as tar:
        for item in os.listdir(extract_path):
            item_path = os.path.join(extract_path, item)
            tar.add(item_path, arcname=item)

    shutil.rmtree(extract_path)
    os.remove(main_archive_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Process a tar archive containing other tar archives.')
    parser.add_argument('archive_path', type=str, help='Path to the tar archive')
    args = parser.parse_args()

    process_archives(args.archive_path)