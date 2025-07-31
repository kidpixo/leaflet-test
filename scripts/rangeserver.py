#!/usr/bin/env python3
from http.server import HTTPServer, test
from RangeHTTPServer import RangeRequestHandler
import sys

class CORSRangeRequestHandler(RangeRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        RangeRequestHandler.end_headers(self)

if __name__ == '__main__':
    test(CORSRangeRequestHandler, HTTPServer, port=int(sys.argv[1]) if len(sys.argv) > 1 else 44000)