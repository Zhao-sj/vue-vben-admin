/**
 * 并行任务
 * @param tasks 任务集合
 * @param parallelCount 任务并行数
 */
export function paralleTask<T>(tasks: (() => Promise<T>)[], parallelCount = 2) {
  return new Promise<T[] | void>((resolve) => {
    if (tasks.length === 0) {
      resolve();
      return;
    }

    let nextIndex = 0;
    let finishCount = 0;
    const result: (T | undefined)[] = Array.from({ length: tasks.length });

    function _run() {
      const currentIndex = nextIndex;
      const task = tasks[currentIndex];
      nextIndex++;
      if (task) {
        task().then((res) => {
          finishCount++;
          result[currentIndex] = res;
          if (nextIndex < tasks.length) {
            _run();
          } else if (finishCount === tasks.length) {
            resolve(result as T[]);
          }
        });
      }
    }

    for (let i = 0; i < parallelCount && i < tasks.length; i++) {
      _run();
    }
  });
}
