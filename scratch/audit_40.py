from PIL import Image

img = Image.open('/Users/Aditya/Website/sections/about/assets/sequence_6/frame40.webp').convert('RGB')
print(img.getpixel((0,0)))
