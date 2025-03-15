import sharp from 'sharp';
import { exec } from 'child_process';
import util from 'util'
import stereogramGenerator from './stereogram';
const promisedExec = util.promisify(exec)

const maxX = 480
const maxY = 360


const step3 = async () => {
    console.log('--- Stitching frames into mp4 ---')
    const {stdout, stderr} = await  promisedExec('ffmpeg -i ./assets/step_2_frames/frame_%d.jpg -i ./assets/audio.mp4 -vcodec libx265 -r 30 -crf 25 -preset slower ./assets/output/tada.mp4')
    console.log('--- Completed!!! ---')
}

const step2 = async () => {
    console.log('--- Converting frames to stereogram ---')
    for(let i = 0; i < 6572; i++) {
        console.log(`--- Converting frame ${i+1} ---`)
        // Load frame to use as "depth map"
        const {data, info} = await sharp(`./assets/step_1_frames/bad_apple-${i+1}.jpg`).ensureAlpha().raw().toBuffer({resolveWithObject: true})
        const currStereogram = await stereogramGenerator(data)
        // Save generate stereogram
        await sharp(new Uint8Array(currStereogram), {raw: {channels: 4, width: maxX, height: maxY}}).raw().toFormat('jpg').toFile(`./assets/step_2_frames/frame_${i+1}.jpg`)
    }
    console.log('--- Done converting frames to stereogram ---')

    return
}

const step1 = async () => {
    console.log('--- Extracting frames from mp4 ---')
    const {stdout, stderr} = await  promisedExec('ffmpeg -i ./assets/bad_apple.webm -r 30 ./assets/step_1_frames/bad_apple-%d.jpg')

    // ffmpeg returns both success + error in stderr, so no point in checking
    console.log('--- Frames extracted ---')
}

async function main() {
    try {
        await step1()
        await step2()
        await step3()
    } catch (error) {
        console.log(error?.message)
    }
}

main()
