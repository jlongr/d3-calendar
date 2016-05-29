import cherrypy
import sqlite3 as sql
import os, os.path

#Name-bank.
db         = 'name.db'
sockethost = '127.0.0.1'
socketport = 8080
filepath   = 'home/jorge/server/'
staticpath = filepath + 'public'

###[SQLITE BLOCK]###
#Store the DB connection in the thread_data container.
def connect(thread_index):
    cherrypy.thread_data.db = sql.connect(db)
    cherrypy.thread_data.db.isolation_level = None

#Establishes DB connection when new thread is started.
cherrypy.engine.subscribe('start_thread', connect)

#Alias functions for DB operations.
def commit():
    cherrypy.thread_data.db.commit()

def close():
    cherrypy.thread_data.db.close()


###[CHERRYPY BLOCK]###
#Class for generating the web page object.
class Root(object):

    @cherrypy.expose
    def index(self):
        return 'init'

    @cherrypy.expose
    def insert(self):
        value = ('hello world',)
        cur = cherrypy.thread_data.db.cursor()
        query = "INSERT INTO table_name VALUES (null, ?);"
        cur.execute(query, value)
        commit()
        return 'success'

    @cherrypy.expose
    def shutdown(self):
        cherrypy.server.stop()
        cherrypy.engine.exit()
        return 'shutdown'

###[EXECUTION BLOCK]###
if __name__ == '__main__':
    #Establish a path for static content in the local directory.
    conf = {
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': os.path.abspath(os.getcwd()),
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': staticpath
        }
    }
    #Set the app to listen on port <socketport> from the local address.
    #(The router must foward port 80 to the local address for external access.)
    cherrypy.config.update({'server.socket_host': sockethost,
                            'server.socket_port': socketport,
                           })
    #Start the app.
    cherrypy.quickstart(Root(), '/', conf)
