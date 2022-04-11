module.exports = {
  apps : [
		{
			name: 'dev-alopuapi',
			script: 'node/index.js',
			args: '--level dev',
			autorestart: true,
			watch: true,
			max_memory_restart: '600M',
		},
		{
			name: 'prod-alopuapi',
			script: 'node/index.js',
			args: '--level prod',
			autorestart: true,
			watch: false,
			max_memory_restart: '600M',
		}
	]
};
