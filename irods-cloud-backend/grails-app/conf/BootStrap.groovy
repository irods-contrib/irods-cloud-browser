import org.irods.jargon.core.connection.SettableJargonProperties

class BootStrap {

    def irodsAccessObjectFactory
    def irodsSession
    def grailsApplication

    def init = { servletContext ->
        System.out.println("jargon Props:" + irodsSession.getJargonProperties())
        System.out.println("configured ssl negot:" + grailsApplication.config.beconf.negotiation.policy)
        def props = new SettableJargonProperties(irodsAccessObjectFactory.jargonProperties)
        props.negotiationPolicy = grailsApplication.config.beconf.negotiation.policy
        irodsSession.jargonProperties = props

    }
    def destroy = {
    }
}
