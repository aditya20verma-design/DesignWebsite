from PIL import Image, ImageDraw
import os
import shutil

orig_path = '/Users/Aditya/Website/sections/about/assets/sequence_6/frame1.webp'
artifact_dir = '/Users/376685/.gemini/antigravity/brain/baae4689-ab92-4098-84c2-5324b657535d'
orig_artifact = os.path.join(artifact_dir, 'frame1_original.webp')
proc_artifact = os.path.join(artifact_dir, 'frame1_processed.webp')
proc_local = '/Users/Aditya/Website/scratch/frame1_processed.webp'
backup_path = '/Users/Aditya/Website/sections/about/assets/sequence_6/frame1.backup.webp'

# 1. Backup and copy to artifacts
shutil.copy(orig_path, backup_path)
shutil.copy(orig_path, orig_artifact)

# 2. Process image
img = Image.open(orig_path).convert('RGB')

# Target is #141414 (20, 20, 20)
target_color = (20, 20, 20)
# Floodfill from corners to ensure contiguous background is caught
ImageDraw.floodfill(img, (0, 0), target_color, thresh=3)
ImageDraw.floodfill(img, (img.width-1, 0), target_color, thresh=3)
ImageDraw.floodfill(img, (0, img.height-1), target_color, thresh=3)
ImageDraw.floodfill(img, (img.width-1, img.height-1), target_color, thresh=3)

# 3. Save processed image
img.save(proc_local, 'WEBP', quality=95)
img.save(proc_artifact, 'WEBP', quality=95)
print("Done processing frame1.webp")
