from typing import Any, Union
import logging
import json

from core.embedding.cached_embedding import CacheEmbedding
from core.model_manager import ModelManager
from models.dataset import Dataset
from core.model_runtime.entities.model_entities import ModelType
from services.dataset_service import DatasetService
from werkzeug.exceptions import NotFound
from core.tools.entities.tool_entities import ToolInvokeMessage
from core.tools.tool.builtin_tool import BuiltinTool
import numpy as np

class TextSimilarity:
    """Text Similarity.
    """

    def __init__(self) -> None:
        """Initialize TextSimilarity."""
        pass

    def run(self, retrieved_contexts: dict, llm_answer: str) -> str:
        """Run text similarity."""
        dataset_id = retrieved_contexts[0]['metadata']['dataset_id']
        logging.debug(f"TextSimilarity.run: dataset_id={dataset_id}")
        dataset: Dataset = DatasetService.get_dataset(dataset_id)
        if dataset is None:
            raise NotFound("Dataset not found.")

        model_manager = ModelManager()
        embedding_model = model_manager.get_model_instance(
            tenant_id=dataset.tenant_id,
            model_type=ModelType.TEXT_EMBEDDING,
            provider=dataset.embedding_model_provider,
            model=dataset.embedding_model
        )

        embeddings = CacheEmbedding(embedding_model)
        scores = []
        v0 = embeddings.embed_query(llm_answer)
        for c in retrieved_contexts:
            v1 = embeddings.embed_query(c['content'])
            score = np.dot(v0, v1)
            scores.append(score)
        
        result = f"{str(scores)}"
        return result

class TextSimilarityTool(BuiltinTool):
    def _invoke(self, 
                user_id: str,
               tool_parameters: dict[str, Any], 
        ) -> Union[ToolInvokeMessage, list[ToolInvokeMessage]]:
        """
            invoke tools
        """
        contexts = tool_parameters['retrieved_contexts']
        contexts = json.loads(contexts)
        llm_answer = tool_parameters['llm_answer']
        result = TextSimilarity(
            ).run(contexts, llm_answer)
        return self.create_text_message(text=result)
    