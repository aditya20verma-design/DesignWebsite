# Journey Section Images

Place your editorial images for the horizontal scroll section in this folder:
`/Users/Aditya/Website/sections/about/assets/journey/`

### Image Slots:
- `card-1.jpg` (Portrait Large — Card 01)
- `card-2.jpg` (Landscape — Card 02)
- `card-3.jpg` (Square — Card 03)
- `card-4.jpg` (Portrait Small — Card 04)
- `card-5.jpg` (Wide Landscape — Card 05)

### How to use in HTML:
In `index.html`, simply replace the `.hj-card-placeholder` inside `.hj-card-img-wrap` with your `<img>` tag:
```html
<div class="hj-card-img-wrap">
    <img src="sections/about/assets/journey/card-1.jpg" alt="Editorial Work" class="hj-card-img" />
</div>
```
The inner 5–10% horizontal parallax will automatically apply to your images!
