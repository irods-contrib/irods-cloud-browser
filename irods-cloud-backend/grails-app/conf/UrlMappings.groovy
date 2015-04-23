class UrlMappings {

	static mappings = {

		"/login"(resource:"login")

		"/virtualCollection/$name"(resource:"virtualCollection")

		"/collection/$virtualCollection"(resource:"collection")

		"/collection"(resource:"collection")

		"/file"(resource:"file")

		"/download"(resource:"download")

		"/$controller/$action?/$id?(.$format)?"{ constraints { // apply constraints here
			} }

		"/"(view:"/index")
		"500"(view:'/error')
	}
}
