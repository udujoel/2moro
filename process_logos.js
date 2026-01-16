const { Jimp } = require('jimp');

async function process(path) {
    console.log(`Processing ${path}...`);
    try {
        const image = await Jimp.read(path);

        // Autocrop to get just the icon content
        image.autocrop();

        // Target: 200x200 with significant padding to make it look "smaller"
        const size = 200;
        // Padding: 25% of total size on each side => 50px
        // Content size = 100px
        const padding = 50;
        const contentSize = size - (padding * 2);

        // Resize content to fit
        image.contain(contentSize, contentSize);

        // Create new transparent canvas
        const canvas = new Jimp(size, size, 0x00000000);

        // Center the image
        // Since we contained it to 100x100, we just put it at 50,50?
        // Wait, contain might keep aspect ratio and result in e.g. 100x80.
        // So we need to calculate centering.
        const x = (size - image.bitmap.width) / 2;
        const y = (size - image.bitmap.height) / 2;

        canvas.composite(image, x, y);

        await canvas.writeAsync(path);
        console.log(`Saved ${path} (${size}x${size})`);
    } catch (e) {
        console.error(`Error processing ${path}:`, e);
    }
}

(async () => {
    await process('public/logo-light.png');
    await process('public/logo-dark.png');
})();
