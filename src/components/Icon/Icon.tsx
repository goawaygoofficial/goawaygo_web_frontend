import addSvg from '@material-design-icons/svg/filled/add.svg?raw';
import arrowDropDownSvg from '@material-design-icons/svg/filled/arrow_drop_down.svg?raw';
import attachMoneySvg from '@material-design-icons/svg/filled/attach_money.svg?raw';
import calendarMonthSvg from '@material-design-icons/svg/filled/calendar_month.svg?raw';
import calendarTodaySvg from '@material-design-icons/svg/filled/calendar_today.svg?raw';
import cameraAltSvg from '@material-design-icons/svg/filled/camera_alt.svg?raw';
import checkSvg from '@material-design-icons/svg/filled/check.svg?raw';
import directionsBusSvg from '@material-design-icons/svg/filled/directions_bus.svg?raw';
import directionsCarSvg from '@material-design-icons/svg/filled/directions_car.svg?raw';
import editSvg from '@material-design-icons/svg/filled/edit.svg?raw';
import gavelSvg from '@material-design-icons/svg/filled/gavel.svg?raw';
import healthAndSafetySvg from '@material-design-icons/svg/filled/health_and_safety.svg?raw';
import hotelSvg from '@material-design-icons/svg/filled/hotel.svg?raw';
import languageSvg from '@material-design-icons/svg/filled/language.svg?raw';
import notificationsSvg from '@material-design-icons/svg/filled/notifications.svg?raw';
import personSvg from '@material-design-icons/svg/filled/person.svg?raw';
import placeSvg from '@material-design-icons/svg/filled/place.svg?raw';
import publicSvg from '@material-design-icons/svg/filled/public.svg?raw';
import removeSvg from '@material-design-icons/svg/filled/remove.svg?raw';
import restaurantSvg from '@material-design-icons/svg/filled/restaurant.svg?raw';
import searchSvg from '@material-design-icons/svg/filled/search.svg?raw';
import swapHorizSvg from '@material-design-icons/svg/filled/swap_horiz.svg?raw';
import swapVertSvg from '@material-design-icons/svg/filled/swap_vert.svg?raw';
import locationOnOutlinedSvg from '@material-design-icons/svg/outlined/location_on.svg?raw';
import arrowBackIosSvg from '@material-design-icons/svg/round/arrow_back_ios.svg?raw';
import arrowForwardIosSvg from '@material-design-icons/svg/round/arrow_forward_ios.svg?raw';
import checkCircleOutlineSvg from '@material-design-icons/svg/round/check_circle_outline.svg?raw';
import closeSvg from '@material-design-icons/svg/round/close.svg?raw';
import errorOutlineSvg from '@material-design-icons/svg/round/error_outline.svg?raw';
import helpOutlineSvg from '@material-design-icons/svg/round/help_outline.svg?raw';
import hotelRoundedSvg from '@material-design-icons/svg/round/hotel.svg?raw';
import childCareSvg from '@material-design-icons/svg/sharp/child_care.svg?raw';
import locationOnSvg from '@material-design-icons/svg/sharp/location_on.svg?raw';
import myLocationSvg from '@material-design-icons/svg/sharp/my_location.svg?raw';

/**
 * Google's Material Icons — the same set (and the same filled / rounded / sharp variants) the Flutter app uses
 * through `Icons.*`, so both frontends show identical icons. Names follow Flutter's, e.g. `location_on_sharp`.
 */
const SOURCES = {
  add: addSvg,
  arrow_back_ios_rounded: arrowBackIosSvg,
  arrow_drop_down: arrowDropDownSvg,
  arrow_forward_ios_rounded: arrowForwardIosSvg,
  attach_money: attachMoneySvg,
  calendar_month: calendarMonthSvg,
  calendar_today: calendarTodaySvg,
  camera_alt: cameraAltSvg,
  check: checkSvg,
  check_circle_outline_rounded: checkCircleOutlineSvg,
  child_care_sharp: childCareSvg,
  close_rounded: closeSvg,
  directions_bus: directionsBusSvg,
  directions_car: directionsCarSvg,
  edit: editSvg,
  error_outline_rounded: errorOutlineSvg,
  gavel: gavelSvg,
  health_and_safety: healthAndSafetySvg,
  help_outline_rounded: helpOutlineSvg,
  hotel: hotelSvg,
  hotel_rounded: hotelRoundedSvg,
  language: languageSvg,
  location_on_outlined: locationOnOutlinedSvg,
  location_on_sharp: locationOnSvg,
  my_location_sharp: myLocationSvg,
  notifications: notificationsSvg,
  person: personSvg,
  place: placeSvg,
  public: publicSvg,
  remove: removeSvg,
  restaurant: restaurantSvg,
  search: searchSvg,
  swap_horiz: swapHorizSvg,
  swap_vert: swapVertSvg,
} as const;

export type IconName = keyof typeof SOURCES;

type Shape = { kind: 'path'; d: string } | { kind: 'circle'; cx: string; cy: string; r: string };

/** Pulls the drawable shapes out of an icon's SVG source (paths and circles; nothing else is used). */
function parseShapes(svg: string): Shape[] {
  const shapes: Shape[] = [];
  for (const [element] of svg.matchAll(/<(path|circle)\b[^>]*>/g)) {
    if (element.includes('fill="none"')) continue;
    const attr = (name: string) => new RegExp(`\\b${name}="([^"]*)"`).exec(element)?.[1] ?? '';
    shapes.push(
      element.startsWith('<path')
        ? { kind: 'path', d: attr('d') }
        : { kind: 'circle', cx: attr('cx'), cy: attr('cy'), r: attr('r') },
    );
  }
  return shapes;
}

const SHAPES = Object.fromEntries(
  Object.entries(SOURCES).map(([name, svg]) => [name, parseShapes(svg)]),
) as Record<IconName, Shape[]>;

interface IconProps {
  name: IconName;
  className?: string;
}

/** A decorative Material icon in the current text colour. Give the control around it an accessible name. */
export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {SHAPES[name].map((shape, index) =>
        shape.kind === 'path' ? (
          <path key={index} d={shape.d} />
        ) : (
          <circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />
        ),
      )}
    </svg>
  );
}
