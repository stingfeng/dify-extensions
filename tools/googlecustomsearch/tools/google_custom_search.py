import os
import sys
import json
from typing import Any, Union, Dict
import logging

from core.tools.entities.tool_entities import ToolInvokeMessage
from core.tools.tool.builtin_tool import BuiltinTool


class HiddenPrints:
    """Context manager to hide prints."""

    def __enter__(self) -> None:
        """Open file to pipe stdout to."""
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, "w")

    def __exit__(self, *_: Any) -> None:
        """Close file that stdout was piped to."""
        sys.stdout.close()
        sys.stdout = self._original_stdout

class GoogleCustomSearchAPI:
    """Wrapper around GoogleCustomSearchAPI.

    To use, you should have the ``google-api-python-client`` python package installed,
    and the environment variable ``GOOGLEAPI_API_KEY`` and ``GOOGLE_CSE_ID`` set with your API key and CSE ID, or pass
    `google_api_key` and `google_cse_id` as a named parameter to the constructor.

    Example:
        .. code-block:: python

            from langchain.utilities import GoogleCustomSearchAPIWrapper
            gcsapi = GoogleCustomSearchAPIWrapper()
    """

    search_engine: Any  #: :meta private:
    api_key: str = None
    cse_id: str = None
    num_results: int = 5
    site_search: str = None

    def __init__(self, api_key: str = None, cse_id: str = None, num_results: int = 5, site_search: str = None) -> None:
        """Initialize GoogleCustomSearchAPI."""
        self.api_key = api_key
        self.cse_id = cse_id
        self.num_results = num_results
        self.site_search = site_search
    
        try:
            from googleapiclient.discovery import build
            def google_search(q, api_key, cse_id, **kwargs):
                service = build("customsearch", "v1", developerKey=api_key)
                res = service.cse().list(q=q, cx=cse_id, **kwargs).execute()
                return res

            self.search_engine = google_search
        except ImportError:
            raise ValueError(
                "Could not import googleapiclient python package. "
                "Please install it with `pip install google-api-python-client`."
            )

    def run(self, query: str, **kwargs: Any) -> str:
        """Run query through GoogleCustomSearchAPI and parse result."""
        typ = kwargs.get("result_type", "text")
        result = self._process_response(self.results(query), typ=typ)
        logging.debug(f"GoogleCustomSearchAPI.run: query={query}\n\nresult={result}")
        return result

    def results(self, query: str) -> dict:
        """Run query through GoogleCustomSearchAPI and return the raw result."""
        params = self.get_params(query)
        with HiddenPrints():
            search = self.search_engine(**params)
        return search

    def get_params(self, query: str) -> Dict[str, str]:
        """Get parameters for GoogleCustomSearchAPI."""
        params = {
            "api_key": self.api_key,
            "cse_id": self.cse_id,
            "q": query,
            "num": self.num_results,
        }
        if self.site_search:
            params["siteSearch"] = self.site_search
            params["siteSearchFilter"] = "i"
        return params

    def _process_response(self, res: dict, typ:str) -> str:
        """Process response from GoogleCustomSearchAPI."""
        if "error" in res.keys():
            raise ValueError(f"Got error from GoogleCustomSearchAPI: {res['error']}")
        elif 'items' in res.keys() and len(res['items']) > 0:
            if typ == "text":
                toret = ""
                for item in res["items"][:self.num_results]:
                    if "link" in item:
                        toret += "----------------\nlink: " + item["link"] + "\n"
                    if "title" in item:
                        toret += "title: " + item["title"] + "\n"
                    if "snippet" in item:
                        toret += "snippet: " + item["snippet"] + "\n"
            elif typ == "link":
                toret = ""
                for item in res["items"][:self.num_results]:
                    if "title" not in item.keys() or "link" not in item.keys():
                        continue
                    toret += f"[{item['title']}]({item['link']})\n"
            elif typ == "json":
                results = []
                for item in res["items"][:self.num_results]:
                    resource = {}
                    if "title" in item.keys():
                        resource['title'] = item['title']
                    if "link" in item:
                        resource['url'] = item['link']
                    if "snippet" in item:
                        resource['snippet'] = item['snippet']
                    results.append(resource)
                toret = json.dumps(results, ensure_ascii=False)
        else:
            raise ValueError(f"No good custom search result found")
        return toret

class GoogleCustomSearchTool(BuiltinTool):
    def _invoke(self, 
                user_id: str,
               tool_parameters: dict[str, Any], 
        ) -> Union[ToolInvokeMessage, list[ToolInvokeMessage]]:
        """
            invoke tools
        """
        query = tool_parameters['query']
        num_results = tool_parameters.get('google_num_results', 5)
        site_search = tool_parameters.get('google_site_search', None)
        result_type = tool_parameters['result_type']
        api_key = self.runtime.credentials['google_api_key']
        cse_id = self.runtime.credentials['google_cse_id']
        result = GoogleCustomSearchAPI(
            api_key=api_key,
            cse_id=cse_id,
            num_results=num_results,
            site_search=site_search
            ).run(query, result_type=result_type)
        if result_type == 'text':
            return self.create_text_message(text=result)
        return self.create_link_message(link=result)
    