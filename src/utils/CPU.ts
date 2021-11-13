export default function CPU(): Promise<number> {
  return new Promise((resolve, reject) => {
    let previous = process.cpuUsage();
    let startDate = Date.now();
    setTimeout(() => {
      let usage = process.cpuUsage(previous);
      resolve(
        (100 * (usage.user + usage.system)) / ((Date.now() - startDate) * 1000)
      );
    });
  });
}
