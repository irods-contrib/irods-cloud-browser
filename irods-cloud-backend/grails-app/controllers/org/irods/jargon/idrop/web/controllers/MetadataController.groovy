package org.irods.jargon.idrop.web.controllers

import grails.converters.JSON

import org.irods.jargon.core.pub.IRODSAccessObjectFactory
import org.irods.jargon.core.pub.domain.AvuData
import org.irods.jargon.idrop.web.services.MetadataService

/**
 * Controller for metadata operations
 * l controllers, simple urls, simple parameters are the rule
 * 
 * @author Mike Conway - DICE
 *
 */
class MetadataController {

	static responseFormats = ['json']
	IRODSAccessObjectFactory irodsAccessObjectFactory
	MetadataService metadataService

	/**
	 * PUT method to add an avu
	 * params:
	 * irodsAbsolutePath
	 * attribute
	 * value
	 * unit
	 * @return
	 */
	def update() {
		log.info("update() for PUT")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def irodsAbsolutePath = params.irodsAbsolutePath
		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null irodsAbsolutePath")
		}

		def attribute = params.attribute
		if (!attribute) {
			throw new IllegalArgumentException("null attribute")
		}

		def value = params.value
		if (!value) {
			throw new IllegalArgumentException("null value")
		}

		def unit = params.unit
		if (!unit) {
			throw new IllegalArgumentException("null unit")
		}

		def avuData = AvuData.instance(attribute, value, unit)
		metadataService.addAvu(irodsAbsolutePath, avuData, irodsAccount)
		render avuData as JSON
	}

	/**
	 * POST method for update of avu
	 * parms
	 * irodsAbsolutePath
	 * (current values)
	 * attribute
	 * value
	 * unit
	 * (new values)
	 * newAttribute
	 * newValue
	 * newUnits
	 * 
	 */
	def save() {
		log.info("save() for POST")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def irodsAbsolutePath = params.irodsAbsolutePath
		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null irodsAbsolutePath")
		}

		def attribute = params.attribute
		if (!attribute) {
			throw new IllegalArgumentException("null attribute")
		}

		def value = params.value
		if (!value) {
			throw new IllegalArgumentException("null value")
		}

		def unit = params.unit
		if (!unit) {
			throw new IllegalArgumentException("null unit")
		}

		def newAttribute = params.newAttribute
		if (!newAttribute) {
			throw new IllegalArgumentException("null newAttribute")
		}

		def newValue = params.newValue
		if (!newValue) {
			throw new IllegalArgumentException("null newValue")
		}

		def newUnit = params.newUnit
		if (!newUnit) {
			throw new IllegalArgumentException("null newUnit")
		}

		def avuData = AvuData.instance(attribute, value, unit)
		def newAvuData = AvuData.instance(newAttribute, newValue, newUnit)
		metadataService.updateAvu(irodsAbsolutePath, avuData, newAvuData, irodsAccount)
		render avuData as JSON
	}

	/**
	 * DELETE method to remove an avu
	 * params:
	 * irodsAbsolutePath
	 * attribute
	 * value
	 * unit
	 * @return
	 */
	def delete() {
		log.info("delete() for DELETE")
		def irodsAccount = request.irodsAccount
		if (!irodsAccount) throw new IllegalStateException("no irodsAccount in request")

		def irodsAbsolutePath = params.irodsAbsolutePath
		if (!irodsAbsolutePath) {
			throw new IllegalArgumentException("null irodsAbsolutePath")
		}

		def attribute = params.attribute
		if (!attribute) {
			throw new IllegalArgumentException("null attribute")
		}

		def value = params.value
		if (!value) {
			throw new IllegalArgumentException("null value")
		}

		def unit = params.unit
		if (!unit) {
			throw new IllegalArgumentException("null unit")
		}

		def avuData = AvuData.instance(attribute, value, unit)
		metadataService.deleteAvu(irodsAbsolutePath, avuData, irodsAccount)
		render avuData as JSON
	}
}
