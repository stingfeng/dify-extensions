from typing import Any

from core.tools.errors import ToolProviderCredentialValidationError
from core.tools.provider.builtin.textsimilarity.tools.text_similarity import TextSimilarityTool
from core.tools.provider.builtin_tool_provider import BuiltinToolProviderController


class TextSimilarityProvider(BuiltinToolProviderController):
    def _validate_credentials(self, credentials: dict[str, Any]) -> None:
        try:
            TextSimilarityTool().fork_tool_runtime(
                meta={
                    "credentials": credentials,
                }
            ).invoke(
                user_id='',
                tool_parameters={
                    "retrieved_contexts": "[]",
                    "llm_answer": "test"
                },
            )
        except Exception as e:
            raise ToolProviderCredentialValidationError(str(e))