class ThreadNotFound(Exception):
    """指定されたスレッドが見つからない"""

    def __init__(self, thread_id: str) -> None:
        self.thread_id = thread_id
        super().__init__(f"Thread not found: {thread_id}")
