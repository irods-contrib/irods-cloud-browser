class UrlMappings {

	static mappings = {

		"/login"(resource:"login")

		"/$controller/$action?/$id?(.$format)?"{ constraints {
				// apply constraints here
			} }

		"/"(view:"/index")
		"500"(view:'/error')
	}
}
