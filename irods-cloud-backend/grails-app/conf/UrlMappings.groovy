class UrlMappings {

	static mappings = {

		"/login"(resource:"login")

		"/logout"(resource:"logout")

		"/virtualCollection/$name"(resource:"virtualCollection")

		"/collection/$virtualCollection"(resource:"collection")

		"/collection"(resource:"collection")

		"/file"(resource:"file")

		"/star"(resource:"star")

		"/download"(resource:"download")

		"/copy"(resource:"copy")

		"/move"(resource:"move")

		"/metadata"(resource:"metadata")

		"/fileCreatorTemplate"(resource:"fileCreatorTemplate")

		"/fileEdit"(resource:"FileEdit")

		"/ruleExecution"(resource:"RuleExecution")

		"/initialConf"(resource:"initialConf")

		"/$controller/$action?/$id?(.$format)?"{ constraints { // apply constraints here
			} }

		"500"(controller: "error")
	}
}
