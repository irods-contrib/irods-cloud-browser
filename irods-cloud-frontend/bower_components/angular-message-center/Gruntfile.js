module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		clean: {
			dist: 'dist'
		},
		concat: {
			dist: {
				src: ['message-center.js','message-center-templates.js'],
				dest: 'dist/message-center.js'
			}
		},
		copy: {
            main: {
                src: 'message-center.css',
                dest: 'dist/'
            }
        },
		jshint: {
			options:{
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true
			}
		},
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                runnerPort: 9876,
                singleRun: true,
                reporters: ['progress'],
                browsers: ['PhantomJS']
            }
        },
		uglify: {
			build: {
				src: 'dist/message-center.js',
				dest: 'dist/message-center.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');

	grunt.registerTask('default', ['clean', 'jshint', 'karma', 'concat', 'uglify', 'copy']);
	grunt.registerTask('test', ['karma']);
}