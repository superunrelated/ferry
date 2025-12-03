import { useEffect, RefObject } from 'react';

export function useTimetableScroll(
  scrollContainerRef: RefObject<HTMLDivElement>,
  nextSailingRef: RefObject<HTMLTableRowElement>,
  currentDayHeaderRef: RefObject<HTMLTableCellElement>,
  loading: boolean,
  nextSailingTime: string | null,
  hasData: boolean
) {
  useEffect(() => {
    if (loading || !hasData || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    setTimeout(() => {
      let scrollTop = container.scrollTop;
      let scrollLeft = container.scrollLeft;

      if (nextSailingTime && nextSailingRef.current) {
        const row = nextSailingRef.current;
        const rowTop = row.offsetTop;
        const containerHeight = container.clientHeight;
        const rowHeight = row.offsetHeight;

        scrollTop =
          rowTop -
          container.scrollTop -
          containerHeight / 2 +
          rowHeight / 2 +
          container.scrollTop;
      }

      if (currentDayHeaderRef.current) {
        const header = currentDayHeaderRef.current;
        const headerLeft = header.offsetLeft;
        const containerWidth = container.clientWidth;
        const headerWidth = header.offsetWidth;

        scrollLeft =
          headerLeft -
          container.scrollLeft -
          containerWidth / 2 +
          headerWidth / 2 +
          container.scrollLeft;
      }

      container.scrollTo({
        top: scrollTop,
        left: scrollLeft,
        behavior: 'smooth',
      });
    }, 100);
  }, [loading, nextSailingTime, hasData]);
}
