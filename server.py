import cherrypy
import sqlite3 as sql
import os, os.path

#Name-bank.
db         = 'apd.db'
sockethost = '127.0.0.1'
socketport = 8080
filepath   = 'home/jorge/Documents/GitHub/d3-calendar/'
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

    # Try localhost:8080/index?selection=DWI
    @cherrypy.expose
    def index(self, selection='THEFT'):
        cur = cherrypy.thread_data.db.cursor()
        page = ''

        query = 'SELECT DISTINCT type FROM incident'
        cur.execute(query)
        commit()

        params = cur.fetchall()
        template = '<option value="{value}" onclick="location.href=\'index?selection={value}\'">{value}</option>'
        content = ''
        for p in params:
            content += template
            content = content.replace('{value}', p[0])

        page += '<select>' +content+ '</select><br>'

        query = '''SELECT date, count(id) AS total
                   FROM incident WHERE type = ?
                   GROUP BY date'''
        cur.execute(query, (selection,))
        commit()

        data = cur.fetchall()
        template = '<li> {date} . . . . . {value}</li>'
        content  = ''
        for d in data:
            content += template
            content = content.replace('{date}', str(d[0]))
            content = content.replace('{value}', str(d[1]))

        page += 'Incident Type: ' +selection+ '<ul>' +content+ '</ul>'

        return page



    #@cherrypy.expose
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
