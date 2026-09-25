import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/es";

dayjs.extend(isoWeek);
dayjs.locale("es");

export default dayjs;