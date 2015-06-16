/**
 * Created by Mike on 2/25/14.
 */
module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        // configured a task
        concat: {
            vendorjs: {
                src: ['js/vendor/angular-file-upload-shim-min.js','js/vendor/jquery-1.10.2.min.js','js/vendor/bootstrap.js','js/vendor/angular.js', 'js/vendor/angular-route.js','js/vendor/angular-resource.js','js/vendor/angular-translate.js','js/vendor/message-center.js', 'js/vendor/loading-bar.js','js/vendor/angular-file-upload.min.js'],
                dest: 'web-app/js/vendor.js'
            },
            css: {
                src: ['css/*.css'],
                dest: 'web-app/css/app.css'
            },
            appjs: {
                src: ['js/app/**/*.js'],
                dest: 'web-app/js/app.js'
            }
        },

        /*
         distribute built javascript and web packages to the idrop3 main grails app
         https://www.npmjs.org/package/grunt-mcopy */
        copy: {
            main: {
                files: [
                    // copy assets to dist
                    {expand: true, src: ['assets/**/*.html'], dest: 'web-app'},
                    {expand: true, src: ['index.html'], dest: 'web-app'},
                    {expand: true, src: ['fonts/*.*'], dest: 'web-app'},
                    {expand: true, src: ['images/**/*.*'], dest: 'web-app'},
                    //{expand: true, src: ['js/app/**/*.js'], dest: 'web-app'},
                    {expand: true, src: ['css/**/*.css.map'], dest: 'web-app'},
                    {expand: false, src: ['js/vendor/angular-animate.min.js.map'], dest: 'web-app/js/angular-animate.min.js.map'},
                    {expand: false, src: ['js/vendor/angular-animate.min.js'], dest: 'web-app/js/angular-animate.min.js'},

                    // includes files within path and its sub-directories
                    {expand: true, src: ['web-app/**'], dest: '../idrop-web3'}

                ]
            }
        },
        clean: ["web-app"],
        /*
        * Run tests via Karma https://www.npmjs.org/package/grunt-karma
        * */
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                background: true
            }
        },
        watch: {
            vendorjs: {
                files: ['<%= concat.vendorjs.src %>'],
                tasks: ['concat:vendorjs', 'karma:unit:run', 'copy']
            },
            js: {
                files: ['js/app/**/*.js'],
                tasks: ['karma:unit:run', 'concat:appjs','copy']
            },
            unittestjs: {
                files: ['js/test/unit/**/*.js'],
                tasks: ['karma:unit:run']
            },
            css: {
                files: ['<%= concat.css.src %>', 'css/**/*.css.map'],
                tasks: ['concat:css', 'copy']
            },
            images: {
                files: ['images/*.*'],
                tasks: ['copy']
            },
            fonts: {
                files: ['fonts/**/*.*'],
                tasks: ['copy']
            },
            assets: {
                files: ['assets/**/*.html'],
                tasks: ['copy']
            },
            index: {
                files: ['index.html'],
                tasks: ['copy']
            }

        }
    });

    // loaded a task from npm module
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-mcopy");
    grunt.loadNpmTasks('grunt-karma');

    // loading of custom tasks
    grunt.loadTasks("tasks");

    // load a custom task

    // set our workflow
    grunt.registerTask("default", ["clean","concat", "karma:unit:run", "copy", "watch"]);

};