from PIL import Image

img = Image.open('/Users/Aditya/Website/scratch/frame1.backup.webp').convert('RGB')
w, h = img.size

points = [
    (0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50),
    (w-1, 0), (0, h-1), (w-1, h-1),
    (w//2, h//2)
]

for p in points:
    print(f"{p}: {img.getpixel(p)}")
