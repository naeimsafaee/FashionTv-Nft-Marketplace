const AWS = require("aws-sdk");
const fs = require("fs");
const cnf = require("config").get("files.S3");

AWS.config.update({
	accessKeyId: cnf.accessKeyId,
	secretAccessKey: cnf.secretAccessKey,
});

const AWSS3 = new AWS.S3();

module.exports = class S3Storage {
	//on startup check connectivity
	static async initializing() {
		return new Promise((resolve, reject) => {
			AWSS3.listBuckets((e, data) => {
				if (e) reject(e);
				else resolve(data);
			});
		});
	}

	//check a file existance
	/**
	 *
	 * @param {String} Bucket directory name
	 * @param {String} Key file name
	 */
	static async check(Bucket, Key) {
		return new Promise((resolve, reject) => {
			AWSS3.getObjectAcl({ Bucket, Key }, (e, data) => {
				if (e) reject(e);
				else resolve(data);
			});
		});
		/*
            ? success
            {
                Owner: {
                    DisplayName: 'نیازمندیهای همشهری',
                    ID: '864fbe57-970e-4ce8-981a-fea6e5a29882'
                },
                Grants: [ { Grantee: [Object], Permission: 'FULL_CONTROL' } ]
            }
 
            ! fail
            throw err
        */
	}

	/**
	 *
	 * @param {String} Bucket directory name
	 * @param {Number} Expires expire time in seconds
	 * @param {String[]} arrayOfKeys array of file naames
	 */
	static async getSign(Bucket, Expires, arrayOfKeys) {
		Expires = Expires ?? cnf.expiries.default;
		let result = {};
		for (const key of arrayOfKeys) {
			let obj = {
				name: path,
				url: AWSS3.getSignedUrl("getObject", { Bucket, Key, Expires }),
			};
			result[key] = obj;
		}
		return result;
	}

	/**
	 *
	 * @param {String} pathToFile peth to file including file name
	 * @param {String} Bucket directory of file after uploading
	 * @param {String} Key file name after uploading
	 * @param {String} ContentType file header like 'image/jpeg'
	 */
	static async upload(pathToFile, Bucket, Key, ContentType) {
		return new Promise((resolve, reject) => {
			fs.readFile(pathToFile, (e, file) => {
				AWSS3.upload({ Bucket, Key, Body: file, ContentType }, (e, data) => {
					if (e) reject(e);
					else resolve(data);
				});
			});
		});
		/*
            ? success
                {
                    ETag: '"d115dbc696708ce2c891785d6dcb65db"',
                    Location: 'https://s3.ir-thr-at1.arvanstorage.com/itemspicture/diagram_01.pdf',
                    key: 'diagram_01.pdf',
                    Key: 'diagram_01.pdf',
                    Bucket: 'itemspicture'
                }
            ! on duplicate
                replace...
        */
	}

	/**
	 *
	 * @param {String} Bucket directory name
	 * @param {String} Key file name
	 */
	static async delete(Bucket, Key) {
		return new Promise((resolve, reject) => {
			AWSS3.deleteObject({ Bucket, Key }, (e, data) => {
				if (e) reject(e);
				else resolve(data);
			});
		});
		/*
            ? success
            ! fail
            {} an empty object
        */
	}

	/**
	 *
	 * @param {String} Bucket directory name to flush
	 */
	static async flushBucket(Bucket) {
		return new Promise(async (resolve, reject) => {
			try {
				const { Contents } = await AWSS3.listObjects({
					Bucket,
				}).promise();
				if (Contents.length > 0) {
					await AWSS3.deleteObjects({
						Bucket,
						Delete: {
							Objects: Contents.map(({ Key }) => ({ Key })),
						},
					}).promise();
				}
				resolve(true);
			} catch (e) {
				reject(e);
			}
		});
	}
};
