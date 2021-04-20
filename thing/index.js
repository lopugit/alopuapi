
let cwd = __dirname
let log = console.log
let smarts = require('smarts')()
let shell = require('shelljs')
let exporter = (args={})=>{
	let hosts = [
		'192.168.0.70 backup'
	]
	let thing = {}
	smarts.setsmart(thing, 'nginx.settings',
		[
			{
				server_name: 'beta.api.alopu.com',
				certbot: true,
				protocol: 'http://',
				ips: [
					`${args.host || 'alopu' || 'host.docker.internal'}:9999`,
					...hosts
				]
			},
			{
				server_name: 'alopu.com',
				certbot: true,
				dir: '/things/statics/alopu.com/dist/pwa/',
				rewrite: 'rewrite ^.*$ /;'
			},
			{
				server_name: 'api.alopu.com',
				certbot: true,
				protocol: 'http://',
				ips: [
					`${args.host || 'alopu' || 'host.docker.internal'}:9999`,
					...hosts
				]
			},
			{
				server_name: 'api.alopu.src',
				self_signed: true,
				protocol: 'http://',
				ips: [
					`${args.host || 'alopu' || 'host.docker.internal'}:9999`,
					...hosts
				]
			},
			{
				server_name: 'auth.alopu.src',
				self_signed: true,
				protocol: 'http://',
				ips: [
					`${args.host || 'alopu' || 'host.docker.internal'}:9999`,
					...hosts
				]
			},
		]
	)

	smarts.setsmart(thing, 'ai', (args)=>{
		ostype = shell.exec(`echo $OSTYPE`)
		if(ostype.indexOf("darwin") >= 0){

			// manage alopuapi program
			let status,
					match = `online`

			let reg = new RegExp(match, 'g')

			// check if running
			status = shell.exec(`pm2 show alopuapi | grep status`).stdout

			if(status.match(reg) != null){
				log('Alopuapi is running')
			} else {
				log('Starting Alopuapi')
				log(
					shell.exec(`
						cd ${cwd}/../ ;
						npm run dev ;
					`)
				)
			}
		} else if (ostype.indexOf("linux") >= 0 && shell.exec('which docker').stdout.length > 0) {
			let status,
					match = `Up`

			let reg = new RegExp(match, 'g')

			// check if running
			status = shell.exec(`docker ps -l | grep alopuapi`).stdout

			if(status.match(reg) != null){
				let time = Date.now()
				log(time)
				log('Alopuapi is running')
				log(time)
			} else {
				let time = Date.now()
				log(time)
				log('Starting Alopuapi')
				log(time)
				// log(shell.exec(`
				// 	cd ${cwd} ;
				// 	npm run dev ;
				// `))
			}
		}
	})
	return thing
}
module.exports = (args={})=>{
	return exporter(args)
}

exporter()