const { EventPerson } = require("../../databases/mongodb");
const { NotFoundError, HumanError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const axios = require("axios").default;
const sharp = require("sharp");
const qrCode = require("qrcode");
const { v4: uuidV4 } = require("uuid");
const { Readable } = require("stream");
const AWS = require("aws-sdk");
const awsConfigs = require("config").get("files.S3");

AWS.config.update({
	accessKeyId: awsConfigs.accessKeyId,
	secretAccessKey: awsConfigs.secretAccessKey,
});

const s3Config = new AWS.S3({
	signatureVersion: "v4",
});

function editEvent(id, specificCode, files) {
	return new Promise(async (resolve, reject) => {
		if (!files || !files.signature) {
			return reject(new HumanError(Errors.SIGNATURE_UPLOAD.MESSAGE, Errors.SIGNATURE_UPLOAD.CODE, { id }));
		}

		// let query = {
		// 	_id: id,
		// 	deletedAt: null,
		// };

		// if (specificCode && specificCode != "null") {
		// 	query["specificCode"] = specificCode;
		// }

		// const thisEventPerson = await EventPerson.findOne(query);
		// if (!thisEventPerson)
		// 	return reject(
		// 		new NotFoundError(Errors.EVENT_PERSON_NOT_FOUND.MESSAGE, Errors.EVENT_PERSON_NOT_FOUND.CODE, { id }),
		// 	);

		const axiosResponse = await axios.get(
			"https://ftvio.s3.amazonaws.com/event/images/8f8cbdc2-90e6-49f6-be55-cce560e13d70.jpg",
			{
				responseType: "arraybuffer",
				headers: { Accept: "*/*" },
			},
		);

		const mainImageBuffer = axiosResponse.data;
		const signatureBuffer = files.signature[0].buffer;

		const resizedSignatureBuffer = await sharp(signatureBuffer).resize({ width: 600, height: 1200 }).toBuffer();

		const signature = await sharp(mainImageBuffer)
			.composite([{ input: resizedSignatureBuffer, gravity: "center" }])
			.toBuffer();

		const signatureFileStream = Readable.from(signature);

		const signatureName = uuidV4() + ".jpg";
		const signaturePath = "event/signatures/" + signatureName;

		const signatureFileParam = [
			{
				name: signatureName,
				s3: {
					Bucket: awsConfigs.bucket,
					Key: signaturePath,
					ACL: "public-read",
					CacheControl: null,
					ContentType: "image/jpeg",
					Metadata: null,
					StorageClass: "STANDARD",
					ServerSideEncryption: null,
					SSEKMSKeyId: null,
					Body: signatureFileStream,
				},
			},
		];

		const response = await Promise.all(signatureFileParam.map((param) => s3Config.upload(param.s3).promise()));

		const thisFileResponse = response[0];

		const uploadedSignature = {
			name: signatureName,
			key: "event/signatures/" + signatureName,
			location: thisFileResponse.Location,
		};

		const thisPerson = await new EventPerson({ signature: uploadedSignature }).save();
		// thisEventPerson.signature = uploadedSignature;
		// await thisEventPerson.save();

		return resolve({ data: thisPerson });
	});
}

async function getEvent(id, specificCode) {
	return new Promise(async (resolve, reject) => {
		let query = {
			_id: id,
			deletedAt: null,
		};

		if (specificCode && specificCode != "null") {
			query["specificCode"] = specificCode;
		}

		const result = await EventPerson.findOne(query).lean();

		if (!result)
			return reject(
				new NotFoundError(Errors.EVENT_PERSON_NOT_FOUND.MESSAGE, Errors.EVENT_PERSON_NOT_FOUND.CODE, { id }),
			);

		return resolve({ result });
	});
}

function getEvents(data) {
	return new Promise(async (resolve, reject) => {
		let { page, limit, order, sort } = data;

		const query = { deletedAt: null };

		const count = await EventPerson.countDocuments(query);
		const items = await EventPerson.find(query)
			.select("-__v")
			.sort({ [sort]: order })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: items,
		});
	});
}

function uploadEventPictures(files) {
	return new Promise(async (resolve, reject) => {
		if (!files || files.length === 0) {
			return reject(new HumanError("Please upload at least one picture", 422));
		}

		const eventPersons = [];
		for (let i = 0; i < files.length; i++) {
			const thisFile = files[i];
			const thisPerson = await new EventPerson({
				raw: [
					{
						name: thisFile.newName,
						key: thisFile.key,
						location: thisFile.location,
					},
				],
				qrCode: [],
				signature: [],
				specificCode: uuidV4(),
			});

			const qrCodeBuffer = await qrCode.toBuffer(
				`https://ftvio.com/campaign/${String(thisPerson._id)}?specificCode=${thisPerson.specificCode}`,
			);

			const qrCodetream = Readable.from(qrCodeBuffer);
			const qrCodePath = "event/images/" + thisFile.newName.split(".")[0] + "-qrcode.png";

			const qrCodeParam = [
				{
					name: thisFile.newName.split(".")[0] + "-qrcode.png",
					s3: {
						Bucket: awsConfigs.bucket,
						Key: qrCodePath,
						ACL: "public-read",
						CacheControl: null,
						ContentType: "image/png",
						Metadata: null,
						StorageClass: "STANDARD",
						ServerSideEncryption: null,
						SSEKMSKeyId: null,
						Body: qrCodetream,
					},
				},
			];

			const qrCodeResponse = await Promise.all(qrCodeParam.map((param) => s3Config.upload(param.s3).promise()));
			thisPerson.qrCode = [
				{
					name: thisFile.newName.split(".")[0] + "-qrcode.png",
					key: "event/images/" + thisFile.newName.split(".")[0] + "-qrcode.png",
					location: qrCodeResponse[0].Location,
				},
			];
			eventPersons.push(thisPerson);
		}
		const data = await EventPerson.insertMany(eventPersons);

		return resolve({ data });
	});
}

function getEventSingle(id) {
	return new Promise(async (resolve, reject) => {
		const result = await EventPerson.findOne({ _id: id, deletedAt: null }).lean();

		if (!result)
			return reject(
				new NotFoundError(Errors.EVENT_PERSON_NOT_FOUND.MESSAGE, Errors.EVENT_PERSON_NOT_FOUND.CODE, { id }),
			);

		return resolve({ result });
	});
}

function getEventsAll(data, code) {
	return new Promise(async (resolve, reject) => {
		let { page, limit, order, sort } = data;

		if (code !== "ftv_admin") {
			return reject(new HumanError("Invalid Code", 401));
		}

		const query = { deletedAt: null };

		const count = await EventPerson.countDocuments(query);
		const items = await EventPerson.find(query)
			.select("_id raw signature qrCode specificCode")
			.sort({ [sort]: order })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: items,
		});
	});
}

module.exports = {
	editEvent,
	getEvent,
	getEvents,
	uploadEventPictures,
	getEventSingle,
	getEventsAll,
};
