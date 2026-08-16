from PIL import Image
import os

path = '/Users/Aditya/Website/sections/about/assets/sequence_6/frame1.webp'

print(f"File exists: {os.path.exists(path)}")
if os.path.exists(path):
    img = Image.open(path).convert('RGB')
    w, h = img.size
    
    # Check corners
    corners = {
        'Top-Left': (0, 0),
        'Top-Right': (w-1, 0),
        'Bottom-Left': (0, h-1),
        'Bottom-Right': (w-1, h-1),
    }
    
    # Check points marching inwards from top-left
    marching_points = {
        'Inner 50px': (50, 50),
        'Inner 100px': (100, 100),
        'Inner 200px': (200, 200),
        'Center-ish Left': (w//4, h//2),
        'Center-ish Top': (w//2, h//4),
    }
    
    print("--- Corner Colors ---")
    for name, pos in corners.items():
        print(f"{name} {pos}: {img.getpixel(pos)}")
        
    print("\n--- Inner Background Colors ---")
    for name, pos in marching_points.items():
        print(f"{name} {pos}: {img.getpixel(pos)}")
