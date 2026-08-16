from PIL import Image

img = Image.open('/Users/Aditya/Website/sections/about/assets/sequence_6/frame83.webp').convert('RGB')
w, h = img.size

points = [
    (0, 0), (10, 10), (w-1, 0), (0, h-1), (w-1, h-1),
    (w//2, h//2)
]

for p in points:
    print(f"{p}: {img.getpixel(p)}")
