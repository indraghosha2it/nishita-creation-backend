const bwipjs = require('bwip-js');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('✅ Cloudinary configured for barcode generation');

// Generate CODE128 barcode and upload to Cloudinary
const generateAndUploadBarcodeImage = async (barcodeNumber) => {
  console.log(`📦 Generating CODE128 barcode for: ${barcodeNumber}`);
  
  return new Promise((resolve, reject) => {
    // Remove color options - use defaults
    bwipjs.toBuffer({
      bcid: 'code128',
      text: barcodeNumber,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: 'center',
      textsize: 11
      // Removed textcolor and backgroundcolor
    }, async (err, png) => {
      if (err) {
        console.error('❌ Barcode generation error:', err);
        reject(err);
        return;
      }
      
      console.log(`📸 Uploading to Cloudinary...`);
      
      try {
        const uploadResult = await new Promise((resolveUpload, rejectUpload) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'barcodes',
              public_id: `barcode_${barcodeNumber}_${Date.now()}`,
              format: 'png',
              transformation: [
                { background: 'white', width: 400, height: 150, crop: 'pad' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                rejectUpload(error);
              } else {
                console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
                resolveUpload(result);
              }
            }
          );
          
          const readableStream = Readable.from(png);
          readableStream.pipe(uploadStream);
        });
        
        resolve({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        // Fallback to base64
        const base64 = `data:image/png;base64,${png.toString('base64')}`;
        resolve({ url: base64, publicId: '' });
      }
    });
  });
};

module.exports = { generateAndUploadBarcodeImage };