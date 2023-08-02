const multer = require("multer");
const storage = multer.memoryStorage();

const isAllowedMimetype = (mime) =>
	[
		"image/png",
		"image/jpg",
		"image/jpeg",
		"image/gif",
		"image/x-ms-bmp",
		"image/webp",
		"image/svg+xml",
		"video/mp4",
		"video/webm",
		"audio/mpeg",
		"audio/aac",
		"audio/webm",
		"audio/x-wav",
		"audio/ogg",
		"model/gltf-binary",
		"model/gltf+json",
	].includes(mime.toString());

let invalidFields = [];
const fileFilter = async (req, file, cb) => {
	const fileMime = file.mimetype;
	if (!isAllowedMimetype(fileMime)) {
		invalidFields.push(file.fieldname);
		req.fileValidationError = invalidFields.toString();
		return cb(null, false);
	}
	cb(null, true);
};

const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 1024 * 1024 * 100,
	},
});

exports.uploadNftFile = upload.fields([
	{ name: "nftFile", maxCount: 1 },
	{ name: "previewImage", maxCount: 1 },
]);

exports.signatureUploader = upload.fields([{ name: "signature", maxCount: 1 }]);
