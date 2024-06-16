(async () => {
    const { exec } = require('child_process');
  
    const open = (await import('open')).default;
  
    exec('npm start', { cwd: 'frontend' }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  
    await open('http://localhost:3000/results');
  })();
  