import { exec } from 'node:child_process';

export default function CPU(): Promise<number> {
  return new Promise((resolve, reject) => {
    exec(
      `ps -auxf | egrep -v grep | egrep --color=none "${process.pid}.*\\?.*Ss?l"`,
      (e, stdout, stderr) => {
        if (e) reject([e, stderr]);
        else {
          resolve(Number(stdout.split(/\s/g).filter(a => a !== '')[2]));
        }
      }
    );
  });
}
