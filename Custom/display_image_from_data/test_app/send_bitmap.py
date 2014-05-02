import time
from pyonep import onep
import base64
import os

print('start')

o = onep.OnepV1()

cik = '<CIK_HERE>'
dataport_alias = '<IMAGE_ALIAS_HERE>'

loop = 10

while loop > 0:
	for image_file in os.listdir("images"):

		if image_file.endswith(".jpg"):
			print 'file to send: ' + str(image_file)
			
			encoded_string = ''

			with open('images/'+image_file, "rb") as image_file:
				encoded_string = base64.b64encode(image_file.read())

			#print('writing:' + str(encoded_string))
			try:
				o.write(
					cik,
					{"alias": dataport_alias},
					encoded_string,
					{})
			except Exception, e:
				print e
			time.sleep(5)
	print('loop:',loop)
	loop = loop - 1


