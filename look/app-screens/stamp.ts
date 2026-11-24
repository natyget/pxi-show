import { buildStampScene } from '@/components/stamps/buildStamp';
import { sceneToSvg } from '@/components/stamps/toSvgString';
const [shape, color, name, date] = process.argv.slice(2);
const scene = buildStampScene({ shape: shape as any, color, name, date, seed: name });
process.stdout.write(sceneToSvg(scene!, { width: 300, height: 300 }));
