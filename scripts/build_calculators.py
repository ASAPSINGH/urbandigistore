import os
import sys
import urllib.request
import tarfile
import subprocess
import shutil

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS_DIR = os.path.join(BASE_DIR, 'scripts')
REACT_DIR = os.path.join(BASE_DIR, 'react-src')
DOWNLOAD_DIR = os.path.join(SCRIPTS_DIR, '.node_downloads')
PORTABLE_DIR = os.path.join(SCRIPTS_DIR, '.node_portable')

NODE_VERSION = "v20.11.1"
NODE_DIR_NAME = f"node-{NODE_VERSION}-darwin-arm64"
TAR_FILE = f"{NODE_DIR_NAME}.tar.gz"
DOWNLOAD_URL = f"https://nodejs.org/dist/{NODE_VERSION}/{TAR_FILE}"

def ensure_node():
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    os.makedirs(PORTABLE_DIR, exist_ok=True)
    
    node_bin_dir = os.path.join(PORTABLE_DIR, NODE_DIR_NAME, 'bin')
    node_path = os.path.join(node_bin_dir, 'node')
    npm_path = os.path.join(node_bin_dir, 'npm')
    
    if os.path.exists(node_path) and os.path.exists(npm_path):
        print(f"✅ Portable Node.js is already present at: {node_path}")
        return node_bin_dir
        
    tar_path = os.path.join(DOWNLOAD_DIR, TAR_FILE)
    if not os.path.exists(tar_path):
        print(f"📥 Downloading Node.js portable binary from {DOWNLOAD_URL}...")
        try:
            urllib.request.urlretrieve(DOWNLOAD_URL, tar_path)
            print("✅ Download finished.")
        except Exception as e:
            print(f"❌ Failed to download Node.js: {e}")
            sys.exit(1)
            
    print(f"📦 Extracting Node.js tarball...")
    try:
        with tarfile.open(tar_path, 'r:gz') as tar:
            tar.extractall(path=PORTABLE_DIR)
        print("✅ Extraction complete.")
    except Exception as e:
        print(f"❌ Extraction failed: {e}")
        sys.exit(1)
        
    if os.path.exists(node_path):
        print(f"✅ Node.js portable environment verified: {node_path}")
        return node_bin_dir
    else:
        print("❌ Verification failed. Node binary not found.")
        sys.exit(1)

def run_cmd(args, cwd, bin_dir):
    # Add portable Node bin folder to environment PATH
    env = os.environ.copy()
    env["PATH"] = bin_dir + os.pathsep + env.get("PATH", "")
    
    print(f"🚀 Running command: {' '.join(args)} in {cwd}")
    res = subprocess.run(args, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    if res.stdout:
        print(res.stdout)
    if res.stderr:
        print(res.stderr, file=sys.stderr)
        
    if res.returncode != 0:
        print(f"❌ Command failed with return code {res.returncode}")
        sys.exit(res.returncode)
    else:
        print("✅ Command completed successfully.")

def main():
    print("--- Starting React Calculators Integration Builder ---")
    bin_dir = ensure_node()
    
    # 1. Run npm install in react-src
    print("\n--- Running npm install ---")
    run_cmd(["npm", "install"], cwd=REACT_DIR, bin_dir=bin_dir)
    
    # 2. Run data extraction script
    print("\n--- Extracting SEO and Blog content ---")
    run_cmd(["npx", "tsx", "scripts/extract_data.ts"], cwd=REACT_DIR, bin_dir=bin_dir)
    
    # 3. Compile the React app (npm run build)
    print("\n--- Running Vite Build ---")
    run_cmd(["npm", "run", "build"], cwd=REACT_DIR, bin_dir=bin_dir)
    
    print("\n🎉 Calculator Hub build completed successfully!")

if __name__ == '__main__':
    main()
