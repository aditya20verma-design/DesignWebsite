from PIL import Image

try:
    img = Image.open('/Users/Aditya/Website/sections/about/assets/sequence_6/frame1new.jpg').convert('RGB')
    w, h = img.size
    print(f"Dimensions: {w}x{h}")
    print(f"Aspect Ratio: {w/h:.2f}")
    
    corners = {
        'Top-Left': (0, 0),
        'Top-Right': (w-1, 0),
        'Bottom-Left': (0, h-1),
        'Bottom-Right': (w-1, h-1),
    }
    
    print("Corner Colors:")
    for name, pos in corners.items():
        print(f"  {name}: {img.getpixel(pos)}")
except Exception as e:
    print(f"Error: {e}")
