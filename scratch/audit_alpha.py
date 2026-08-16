from PIL import Image

img = Image.open('/Users/Aditya/Website/scratch/frame1.backup.webp')
w, h = img.size
print(f"Mode: {img.mode}")

points = [
    (0, 0), (10, 10), (w//2, h//2)
]

for p in points:
    print(f"{p}: {img.getpixel(p)}")
