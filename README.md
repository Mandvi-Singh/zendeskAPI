# zendeskAPI
An app to get data from zendesk api.

The application uses OAuth Token Authentication for getting data from the api.
OAuthentication has been used to support CORS. 

Application Input Parameters: 
Client ID: (This can be created under Admin> Channel> API > OAuth Settings)
API URL: (The application has been tested for URL https://trends.zendesk.com/api/v2/users.json, here trends my subdomain)

THe Redirect URL has been set to localhost:8080 under Oauth Setting for the Subdomain.
Once we provide with client id and API url, for first time, it is redirected to authenticate via user email id and password. The data is fetched and
shown as a paragraph after the form. Also  You get an option to download the data in csv format. 

In case of any queries, Please feel free to reach out to email mandvisingh64@gmail.com
