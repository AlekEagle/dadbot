import { exec } from 'node:child_process';

export default function CPU(): Promise<number> {
  return new Promise((resolve, reject) => {
    exec(`top -b -n1`, (e, stdout, stderr) => {
      if (e) reject([e, stderr]);
      else {
        let line = stdout
          .split('\n')
          .filter(a => a.match(new RegExp(`${process.pid}`)))[0];
        resolve(Number(line.split(/\s/g).filter(a => a !== '')[8]));
      }
    });
  });
}
