from langchain_upstage import ChatUpstage

_llm = None


def get_llm() -> ChatUpstage:
    global _llm
    if _llm is None:
        _llm = ChatUpstage(
            model="solar-pro3-260323",
            temperature=0.0,
            top_p=0.1,
        )
    return _llm
