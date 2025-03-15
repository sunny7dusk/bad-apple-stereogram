// https://www2.cs.sfu.ca/CourseCentral/414/li/material/refs/SIRDS-Computer-94.pdf
// https://github.com/tony-pizza/Stereogram.js/blob/master/README.md

const maxX = 480
const maxY = 360
const dpi = 72
const eyeSep = Math.round(1.5 * dpi)
const mu = 1  / 3
function getDepthValue([r,g,b,a]) {
    return (r+g+b)/(255*3)
}

export default async function stereogramGenerator(depthMapImg) {
    let bg = []
    let depthMap = [];
    for (let row = 0; row < maxY; row+=1) {
        bg[row]=[]
        depthMap[row] = [];
        for(let col = 0; col < maxX; col+=1) {
            let brightness = Math.round(Math.random()) *  255
            // fill depthmap with random data for now
            depthMap[row][col] = [col,col,col,255]
            // fill bg with random brightness data to serve as random patterns
            bg[row][col] = [brightness, brightness, brightness, 255]
        }
    }

    for(let row = 0; row < maxY; row++) {
        const rowOffset = row*maxX
        for(let col = 0; col < maxX; col++) {
            for(let i = 0; i < bg[row][col].length; i++) {
                // Incoming data is 1d array, assign to appropriate idx in depth map
                depthMap[row][col][i] = depthMapImg[((rowOffset+col) * 4)+i]
            }
        }
    }


    for(let row = 0; row < maxY; row+=1) {
        let pic = []
        let samePic = []
        let [sep, left, right] = [0,0,0]

        for(let col = 0; col < maxX; col++) {
            pic[col] = bg[row][col]
            samePic[col] = col
        }

        for(let col = 0; col < maxX; col++) {
            let z = getDepthValue(depthMap[row][col])
            sep = Math.round((1 - (mu * z)) * eyeSep / (2 - (mu * z)));
            left = Math.round(col - ((sep + (sep & row & 1)) / 2));
            right = left + sep;
            if(0 <= left && right < maxX) {
                let [t, visible, zt] = [1, false, 0]
                do {
                    zt = z + (2 * (2 - (mu * z)) * t / (mu * eyeSep));
                    visible = (getDepthValue(depthMap[row][col-t]) < zt) && (getDepthValue(depthMap[row][col+t]) < zt); // false if obscured
                    t++;
                } while (visible && zt < 1);

                if (visible) {
                    // record that left and right pixels are the same
                    let k = 0;
                    for (k = samePic[left]; k !== left && k !== right; k = samePic[left]) {
                        if (k < right) {
                            left = k;
                        } else {
                            left = right;
                            right = k;
                        }
                    }
                samePic[left] = right;
                }
            }
            }


        for(let x = maxX - 1; x >= 0; x--) {
            pic[x] = pic[samePic[x]]
            bg[row][x] = pic[x]
        }
    }


    // flatten original bg array to flat 1d array
    let flattenBg = []
    for (let i = 0; i < bg.length; i++) {
        for(let j = 0; j <bg[i].length; j++) {
            for(let k = 0; k < bg[i][j].length ; k++) {
                flattenBg.push(bg[i][j][k])
            }
        }
    }

    return flattenBg;
}
