grails.servlet.version = "3.0" // Change depending on target container compliance (2.5 or 3.0)
grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.work.dir = "target/work"
grails.project.target.level = 1.7
grails.project.source.level = 1.7
//grails.project.war.file = "target/${appName}-${appVersion}.war"

grails.project.fork = [
	// configure settings for compilation JVM, note that if you alter the Groovy version forked compilation is required
	//  compile: [maxMemory: 256, minMemory: 64, debug: false, maxPerm: 256, daemon:true],

	// configure settings for the test-app JVM, uses the daemon by default
	test: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, daemon:true],
	// configure settings for the run-app JVM
	run: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, forkReserve:false],
	// configure settings for the run-war JVM
	war: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, forkReserve:false],
	// configure settings for the Console UI JVM
	console: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256]
]

grails.project.dependency.resolver = "maven" // or ivy
grails.project.dependency.resolution = {
	// inherit Grails' default dependencies
	inherits("global") {
		// specify dependency exclusions here; for example, uncomment this to disable ehcache:
		// excludes 'ehcache'
	}
	log "info" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
	checksums false // Whether to verify checksums on resolve
	legacyResolve false // whether to do a secondary resolve on plugin installation, not advised and here for backwards compatibility

	repositories {
		inherits true // Whether to inherit repository definitions from plugins

		grailsPlugins()
		grailsHome()
		mavenLocal()
		grailsCentral()
		mavenCentral()

		// uncomment these (or add new ones) to enable remote dependency resolution from public Maven repositories
		mavenRepo "http://repository.codehaus.org"
		mavenRepo "http://download.java.net/maven/2/"
		mavenRepo "http://repository.jboss.com/maven2/"
		mavenRepo "http://ci-dev.renci.org/nexus/content/repositories/public"
		mavenRepo "https://raw.github.com/DICE-UNC/DICE-Maven/master/releases"
		mavenRepo "https://raw.github.com/DICE-UNC/DICE-Maven/master/snapshots"
	}

	dependencies {
		// specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes e.g.
		// runtime 'mysql:mysql-connector-java:5.1.29'
		// runtime 'org.postgresql:postgresql:9.3-1101-jdbc41'
		//test "org.grails:grails-datastore-test-support:1.0.2-grails-2.4"
		compile 'commons-io:commons-io:2.1'
		compile 'junit:junit:4.12'
		compile ('org.irods.jargon:jargon-core:4.0.3.1-SNAPSHOT') { excludes ([group:'org.jglobus'])}
		compile ('org.irods.jargon:jargon-data-utils:4.0.3.1-SNAPSHOT')  { excludes ([group:'org.jglobus'])}
		compile ('org.irods.jargon:jargon-ticket:4.0.3.1-SNAPSHOT')   { excludes ([group:'org.jglobus'])}
		compile ('org.irods.jargon:jargon-user-profile:4.0.3.1-SNAPSHOT')  { excludes ([group:'org.jglobus'])}
		compile ('org.irods.jargon:jargon-user-tagging:4.0.3.1-SNAPSHOT')  { excludes ([group:'org.jglobus'])}
		compile ('org.irods.jargon:virtual-collections:4.0.3.1-SNAPSHOT')  { excludes ([group:'org.jglobus'])}
		compile ('org.irods.jargon:jargon-extensions-if:4.0.3.1-SNAPSHOT')  { }
		compile ('org.irods.jargon:file-template:4.0.3.1-SNAPSHOT')  { }
		compile ('org.irods.jargon:jargon-ruleservice:4.0.3.1-SNAPSHOT')  { }
		compile ('org.irods.jargon:dot-irods-utilities:4.0.3.1-SNAPSHOT')  { excludes ([group:'org.jglobus'])}
		compile ('org.irods.jargon:data-profile:4.0.3.1-SNAPSHOT')  { excludes ([group:'org.jglobus'])}
		compile ('org.irods.jargon:jargon-mdquery:4.0.3.1-SNAPSHOT') { excludes ([group:'org.jglobus'])}

		compile 'org.irods.jargon:jargon-zipservice:4.0.3.1-SNAPSHOT'
		runtime 'org.springframework:spring-expression:4.1.6.RELEASE'
		runtime 'org.springframework:spring-aop:4.1.6.RELEASE'
		test ('org.mockito:mockito-all:1.9.5')
		//provided 'javax.servlet:servlet-api:2.5'

		compile( group: 'log4j', name: 'log4j', version: '1.2.16', export: false )
	}

	plugins {
		// plugins for the build system only
		build ":tomcat:7.0.55.2" // or ":tomcat:8.0.20"

		// plugins for the compile step
		compile ":scaffolding:2.1.2"
		compile ':cache:1.1.8'
		compile ":asset-pipeline:2.1.5"
		compile ":cors:1.1.8"


		// plugins needed at runtime but not for compilation
		//runtime ":hibernate4:4.3.8.1" // or ":hibernate:3.6.10.18"
		//runtime ":database-migration:1.4.0"
		//runtime ":jquery:1.11.1"

		// Uncomment these to enable additional asset-pipeline capabilities
		//compile ":sass-asset-pipeline:1.9.0"
		//compile ":less-asset-pipeline:1.10.0"
		//compile ":coffee-asset-pipeline:1.8.0"
		//compile ":handlebars-asset-pipeline:1.3.0.3"
	}
}
