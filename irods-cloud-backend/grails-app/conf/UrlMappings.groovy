class UrlMappings {

	static mappings = {

		"/login"(resource:"login")

		"/virtualCollection/$name"(resource:"virtualCollection")

		"/collection/$virtualCollection"(resource:"collection")

		"/collection"(resource:"collection")

		"/file"(resource:"file")

		"/star"(resource:"star")

		"/download"(resource:"download")

		"/copy"(resource:"copy")

		"/move"(resource:"move")

		"/metadata"(resource:"metadata")

		"/initialConf"(resource:"initialConf")


		"/$controller/$action?/$id?(.$format)?"{ constraints {
				// apply constraints here
			} }

		"500"(controller: "error")
	}
}
