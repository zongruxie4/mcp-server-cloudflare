export async function fileToBase64(blob: Blob): Promise<string> {
	// Use ArrayBuffer instead of text() for binary data
	const arrayBuffer = await blob.arrayBuffer()
	const byteArray = new Uint8Array(arrayBuffer)

	// Convert byte array to base64 string
	let binary = ''
	byteArray.forEach((byte) => {
		binary += String.fromCharCode(byte)
	})

	// Apply base64 encoding
	return btoa(binary)
}
