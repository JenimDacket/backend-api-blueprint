# Define the directories to move
NODE_MODULES_DIR="node_modules"
DIST_DIR="dist"
IOS_DIR="ios"

FOLDER_NAME=$(basename "$PWD")
# Define the target directory in RAMDisk
TARGET_DIR="/Volumes/RAMDisk/$FOLDER_NAME"

# Check if RAMDisk exists
if [ ! -d "$TARGET_DIR" ]; then
    # Create the target directory in RAMDisk if it doesn't exist
    mkdir -p "$TARGET_DIR"
fi

# Function to move directory and create symlink
move_and_link() {
    local src_dir=$1
    local target_dir=$2

    # Check if the source directory exists
    if [ -d "$src_dir" ]; then
        # Move the directory to RAMDisk
        mv "$src_dir" "$target_dir"

        # Create a symlink from the original location to the new location
        ln -s "$target_dir/$(basename $src_dir)" "$(dirname $src_dir)"
    else
        echo "Directory $src_dir does not exist. Skipping."
    fi
}

# Move and link node_modules
move_and_link "$NODE_MODULES_DIR" "$TARGET_DIR"

# Move and link dist
move_and_link "$DIST_DIR" "$TARGET_DIR"

echo "Operation completed."